import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Cantidad de datos a generar
  const NUM_CATEGORIES = 10;
  const NUM_PRODUCTS = 100;

  // Crear categorías aleatorias
  const categories = [];
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    categories.push({ name: faker.commerce.department() });
  }

  const createdCategories = await prisma.category.createMany({
    data: categories,
  });

  console.log(`${NUM_CATEGORIES} categorías creadas.`);

  // Obtener todas las categorías para las relaciones
  const allCategories = await prisma.category.findMany();

  // Crear productos aleatorios con relaciones
  for (let i = 0; i < NUM_PRODUCTS; i++) {
    const randomCategories = faker.helpers.arrayElements(allCategories, 2); // Seleccionar hasta 2 categorías aleatorias

    await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        cuantity: faker.number.int({ min: 1, max: 100 }),
        description: faker.commerce.productDescription(),
        image: faker.image.urlPlaceholder({ width: 640, height: 480 }),
        categories: {
          connect: randomCategories.map((cat) => ({ id: cat.id })),
        },
      },
    });
  }

  console.log(`${NUM_PRODUCTS} productos creados.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
