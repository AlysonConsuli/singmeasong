import { faker } from "@faker-js/faker"
import supertest from "supertest"

import app from "../../src/app.js"
import { prisma } from "../../src/database.js"
import { deleteAllData } from "../factories/scenarioFactory.js"
import * as recommendationFactory from "../factories/recommendationFactory.js"
import { CreateRecommendationData } from "../../src/services/recommendationsService.js"

beforeEach(async () => {
  await deleteAllData()
})

const agent = supertest(app)

describe("recommendations tests", () => {
  it("should create recommendation", async () => {
    const recommendation: CreateRecommendationData = {
      name: faker.music.songName(),
      youtubeLink: "https://www.youtube.com/watch?v=E1jRjGhohpA",
    }

    const response = await agent.post("/recommendations").send(recommendation)
    expect(response.status).toBe(201)
  })

  it("given a recommendation with same name that other, receive 409", async () => {
    const recommendation = recommendationFactory.recommendationBody()
    await recommendationFactory.createRecommendation(recommendation)

    const response = await agent.post("/recommendations").send(recommendation)
    expect(response.status).toBe(409)
  })

  it("given a link that is not from youtube, receive 422", async () => {
    const recommendation = recommendationFactory.recommendationBody()

    const response = await agent.post("/recommendations").send({
      ...recommendation,
      youtubeLink: "https://www.google.com/",
    })
    expect(response.status).toBe(422)
  })
})

describe("recommendations upvote/downvote tests", () => {
  it("should increase score by 1", async () => {
    const recommendation = recommendationFactory.recommendationBody()
    let recommendationSave = await recommendationFactory.createRecommendation(
      recommendation,
    )
    const { id, score } = recommendationSave

    const response = await agent.post(`/recommendations/${id}/upvote`)
    recommendationSave = await recommendationFactory.getRecommendationByName(
      recommendation.name,
    )
    expect(recommendationSave.score).toBe(score + 1)
  })

  it("should decrease score by 1", async () => {
    const recommendation = recommendationFactory.recommendationBody()
    let recommendationSave = await recommendationFactory.createRecommendation(
      recommendation,
    )
    const { id, score } = recommendationSave

    const response = await agent.post(`/recommendations/${id}/downvote`)
    recommendationSave = await recommendationFactory.getRecommendationByName(
      recommendation.name,
    )
    expect(recommendationSave.score).toBe(score - 1)
  })

  it("given a id not registered, receive 404", async () => {
    const recommendation = recommendationFactory.recommendationBody()
    const recommendationSave = await recommendationFactory.createRecommendation(
      recommendation,
    )
    const wrongId = recommendationSave.id + faker.random.numeric(6)

    let response = await agent.post(`/recommendations/${wrongId}/upvote`)
    expect(response.statusCode).toBe(404)

    response = await agent.post(`/recommendations/${wrongId}/downvote`)
    expect(response.statusCode).toBe(404)
  })
})

afterAll(async () => {
  await prisma.$disconnect()
})