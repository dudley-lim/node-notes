/* eslint-disable no-undef */
import app from "../app.js";
import request from "supertest";
import pool from "../src/utils/conn.js";

beforeAll(async () => {
    await pool.query(`DELETE FROM users`);
    await pool.query(`ALTER TABLE users AUTO_INCREMENT = 1`);
    await pool.query(`ALTER TABLE notes AUTO_INCREMENT = 1`);
});

afterAll(async () => {
    await pool.query(`DELETE FROM users`);
    await pool.query(`ALTER TABLE users AUTO_INCREMENT = 1`);
    await pool.query(`ALTER TABLE notes AUTO_INCREMENT = 1`);
    pool.end();
});

describe("Testing auth endpoints", () => {
    describe("Testing register", () => {
        const ENDPOINT = "/api/auth/register";

        it("should throw error 400 (missing fields)", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "",
                "password": "Password-123"
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Required field(s) have missing values");

            const response2 = await request(app).post(ENDPOINT).send({
                "email": "a@a.com",
                "password": ""
            });

            expect(response2.statusCode).toBe(400);
            expect(response2.body.message).toBe("Required field(s) have missing values");

            const response3 = await request(app).post(ENDPOINT).send({
                "email": "",
                "password": ""
            });

            expect(response3.statusCode).toBe(400);
            expect(response3.body.message).toBe("Required field(s) have missing values");
        });

        it("should throw error 400 (not email format)", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "bad email",
                "password": "Password-123"
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Input must be an email");
        });

        it("should throw error 400 (weak password)", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "a@a.com",
                "password": "weakpw"
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Password not strong enough");
        });

        it("should succeed", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("User successfully created");
        });

        it("should throw error 409 (email already taken)", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe("Email already taken");
        });
    });
    
    describe("Testing login", () => {
        const ENDPOINT = "/api/auth/login";

        it("should throw error 400 (missing fields)", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "",
                "password": "Password-123"
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Required field(s) have missing values");

            const response2 = await request(app).post(ENDPOINT).send({
                "email": "a@a.com",
                "password": ""
            });

            expect(response2.statusCode).toBe(400);
            expect(response2.body.message).toBe("Required field(s) have missing values");

            const response3 = await request(app).post(ENDPOINT).send({
                "email": "",
                "password": ""
            });

            expect(response3.statusCode).toBe(400);
            expect(response3.body.message).toBe("Required field(s) have missing values");
        });

        it("should throw error 404 (user doesnt exist)", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "a@b.com",
                "password": "Password-123"
            });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Email does not exist");
        });

        it("should throw error 400 (wrong password)", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "a@a.com",
                "password": "wrongpw"
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Wrong password");
        });

        it("should succeed", async () => {
            const response = await request(app).post(ENDPOINT).send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("User successfully logged in");
            
            // let token = response.headers['set-cookie'];
            // console.log(token);
        });
    });
});

describe("Testing notes endpoints", () => {
    const AUTH_ENDPOINT = "/api/auth";
    const NOTES_ENDPOINT = "/api/notes";

    beforeAll(async () => {
        await request(app).post(AUTH_ENDPOINT + "/register").send({
            "email": "a@b.com",
            "password": "Password-123"
        });

        await pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'a@b.com'");
    });

    describe("Testing POST /api/notes", () => {
        it("should throw error 400 (missing title)", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app)
            .post(NOTES_ENDPOINT)
            .set("Cookie", loginResponse.headers['set-cookie'][0])
            .send({
                "title": "",
                "content": "hello world"
            });

            expect(noteResponse.statusCode).toBe(400);
            expect(noteResponse.body.message).toBe("Title is required");
        });

        it("should succeed", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app)
            .post(NOTES_ENDPOINT)
            .set("Cookie", loginResponse.headers['set-cookie'][0])
            .send({
                "title": "sample title",
                "content": "hello world"
            });

            expect(noteResponse.statusCode).toBe(201);
            expect(noteResponse.body.message).toBe("Note successfully created");
        });
    });

    describe("Testing GET /api/notes", () => {
        it("should get previously created notes", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app).get(NOTES_ENDPOINT).set("Cookie", loginResponse.headers['set-cookie'][0]);

            expect(noteResponse.statusCode).toBe(200);
            expect(noteResponse.body.data).toEqual([
                expect.objectContaining({
                    "note_id": expect.any(Number),
                    "title": expect.any(String),
                    "content": expect.any(String),
                    "author_id": expect.any(Number)
                })
            ]);
        });
    });

    describe("Testing GET /api/notes/:id", () => {
        it("should throw error 404 (note not found)", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app).get(NOTES_ENDPOINT + "/5").set("Cookie", loginResponse.headers['set-cookie'][0]);

            expect(noteResponse.statusCode).toBe(404);
            expect(noteResponse.body.message).toBe("Note not found");
        });

        it("should get note with id of 1", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app).get(NOTES_ENDPOINT + "/1").set("Cookie", loginResponse.headers['set-cookie'][0]);

            expect(noteResponse.statusCode).toBe(200);
            expect(noteResponse.body.data).toEqual(expect.objectContaining({
                "note_id": expect.any(Number),
                "title": expect.any(String),
                "content": expect.any(String),
                "author_id": expect.any(Number)
            }));
        });
    });

    describe("Testing PUT /api/notes/:id", () => {
        it("should throw error 404 (note not found)", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app)
            .put(NOTES_ENDPOINT + "/2")
            .set("Cookie", loginResponse.headers['set-cookie'][0])
            .send({
                "title": "b",
                "content": "hello world"
            });

            expect(noteResponse.statusCode).toBe(404);
            expect(noteResponse.body.message).toBe("Note not found");
        });

        it("should throw error 400 (missing title)", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app)
            .put(NOTES_ENDPOINT + "/1")
            .set("Cookie", loginResponse.headers['set-cookie'][0])
            .send({
                "title": "",
                "content": "hello world"
            });

            expect(noteResponse.statusCode).toBe(400);
            expect(noteResponse.body.message).toBe("Title is required");
        });

        it("should update note with id of 1", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app)
            .put(NOTES_ENDPOINT + "/1")
            .set("Cookie", loginResponse.headers['set-cookie'][0])
            .send({
                "title": "b",
                "content": "hello world"
            });

            expect(noteResponse.statusCode).toBe(200);
            expect(noteResponse.body.message).toBe("Note successfully updated");
        });
    });

    describe("Testing DELETE /api/notes/:id", () => {
        it("should throw error 404 (note not found)", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app).delete(NOTES_ENDPOINT + "/5").set("Cookie", loginResponse.headers['set-cookie'][0]);

            expect(noteResponse.statusCode).toBe(404);
            expect(noteResponse.body.message).toBe("Note not found");
        });

        it("should update note with id of 1", async () => {
            const loginResponse = await request(app).post(AUTH_ENDPOINT + "/login").send({
                "email": "a@a.com",
                "password": "Password-123"
            });

            const noteResponse = await request(app).delete(NOTES_ENDPOINT + "/1").set("Cookie", loginResponse.headers['set-cookie'][0]);

            expect(noteResponse.statusCode).toBe(200);
            expect(noteResponse.body.message).toBe("Note successfully deleted");
            expect(noteResponse.body.data).toEqual(expect.objectContaining({
                "note_id": expect.any(Number),
                "title": expect.any(String),
                "content": expect.any(String),
                "author_id": expect.any(Number)
            }));
        });
    });
});