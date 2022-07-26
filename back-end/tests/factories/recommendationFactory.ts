import { faker } from "@faker-js/faker"

import { prisma } from "../../src/database.js"
import { CreateRecommendationData } from "../../src/services/recommendationsService.js"

export function recommendationBody() {
  const recommendation = {
    name: faker.music.songName(),
    youtubeLink: "https://www.youtube.com/watch?v=E1jRjGhohpA",
  }
  return recommendation
}

export async function createRecommendation(
  recommendation: CreateRecommendationData,
) {
  const recommendationSave = await prisma.recommendation.create({
    data: recommendation,
  })
  return recommendationSave
}

export async function getRecommendationById(id: number) {
  const recommendation = await prisma.recommendation.findFirst({
    where: { id },
  })
  return recommendation
}

export async function updateRecommendationScore(id: number, newScore: number) {
  const recommendation = await prisma.recommendation.update({
    where: { id },
    data: { score: { increment: newScore } },
  })
  return recommendation
}

export async function createManyRecommendations(
  qty: number,
  recommendation: CreateRecommendationData,
) {
  for (let i = 0; i < qty; i++) {
    await prisma.recommendation.create({
      data: {
        ...recommendation,
        name: `${recommendation.name} ${i}`,
      },
    })
  }
}

export async function createManyRecommendationsWithScore(
  qty: number,
  recommendation: CreateRecommendationData,
) {
  for (let i = 0; i < qty; i++) {
    await prisma.recommendation.create({
      data: {
        ...recommendation,
        name: `${recommendation.name} ${i}`,
        score: +faker.random.numeric(2),
      },
    })
  }
}
