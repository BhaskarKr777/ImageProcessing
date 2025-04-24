import weaviate from 'weaviate-ts-client';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Create a Weaviate client
const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

(async () => {
  // Check if 'Meme' class exists
  const existingSchema = await client.schema.getter().do();
  const memeClassExists = existingSchema.classes?.some(c => c.class.toLowerCase() === 'meme');

  if (!memeClassExists) {
    const schemaConfig = {
      class: 'Meme',
      vectorizer: 'img2vec-neural',
      vectorIndexType: 'hnsw',
      moduleConfig: {
        'img2vec-neural': {
          imageFields: ['image']
        }
      },
      properties: [
        {
          name: 'image',
          dataType: ['blob']
        },
        {
          name: 'text',
          dataType: ['string']
        }
      ]
    };

    await client.schema
      .classCreator()
      .withClass(schemaConfig)
      .do();

    console.log('✅ Class "Meme" created successfully.');
  }

  // Upload all images from folder
  const folderPath = './img/';
  const imageFiles = readdirSync(folderPath).filter(file =>
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  for (const file of imageFiles) {
    const imgPath = path.join(folderPath, file);
    const img = readFileSync(imgPath);
    const b64 = Buffer.from(img).toString('base64');

    await client.data.creator()
      .withClassName('Meme')
      .withProperties({
        image: b64,
        text: file
      })
      .do();

    console.log(`✅ Uploaded ${file}`);
  }

  // Pick a test image to compare
  const testImagePath = './sample/image.png';
  try {
    const test = Buffer.from(readFileSync(testImagePath)).toString('base64');

    const resImage = await client.graphql.get()
      .withClassName('Meme')
      .withFields(['image', 'text', '_additional {certainty}'])
      .withNearImage({ image: test })
      .withLimit(3) // Get top 3 similar images
      .do();

    const results = resImage.data.Get.Meme;
    const resultData = [];

    results.forEach((result, index) => {
      const outputPath = `./result/result_${index + 1}.jpg`;
      writeFileSync(outputPath, result.image, 'base64');

      resultData.push({
        path: `/result/result_${index + 1}.jpg`,
        text: result.text,
        certainty: result._additional.certainty.toFixed(4),
      });

      console.log(`🖼️ Similar image ${index + 1}: ${result.text} (certainty: ${result._additional.certainty.toFixed(4)})`);
    });

    // Save the certainty results to JSON
    writeFileSync('./result/result.json', JSON.stringify(resultData, null, 2));

  } catch (err) {
    console.error('⚠️ Test image not found or failed to query:', err.message);
  }
})();








// import weaviate from 'weaviate-ts-client';
// import { readdirSync, readFileSync, writeFileSync } from 'fs';
// import path from 'path';

// // Create a Weaviate client
// const client = weaviate.client({
//   scheme: 'http',
//   host: 'localhost:8080',
// });

// (async () => {
//   // Check if 'Meme' class exists
//   const existingSchema = await client.schema.getter().do();
//   const memeClassExists = existingSchema.classes?.some(c => c.class.toLowerCase() === 'meme');

//   if (!memeClassExists) {
//     const schemaConfig = {
//       class: 'Meme',
//       vectorizer: 'img2vec-neural',
//       vectorIndexType: 'hnsw',
//       moduleConfig: {
//         'img2vec-neural': {
//           imageFields: ['image']
//         }
//       },
//       properties: [
//         {
//           name: 'image',
//           dataType: ['blob']
//         },
//         {
//           name: 'text',
//           dataType: ['string']
//         }
//       ]
//     };

//     await client.schema
//       .classCreator()
//       .withClass(schemaConfig)
//       .do();

//     console.log('Class "Meme" created successfully.');
//   } else {
//     // console.log('Class "Meme" already exists. Skipping creation.');
//   }

//   // Upload all images from folder
//   const folderPath = './img/';
//   const imageFiles = readdirSync(folderPath).filter(file =>
//     /\.(jpg|jpeg|png)$/i.test(file)
//   );

//   for (const file of imageFiles) {
//     const imgPath = path.join(folderPath, file);
//     const img = readFileSync(imgPath);
//     const b64 = Buffer.from(img).toString('base64');

//     await client.data.creator()
//       .withClassName('Meme')
//       .withProperties({
//         image: b64,
//         text: file
//       })
//       .do();

//     console.log(`✅ Uploaded ${file}`);
//   }

//   // Pick a test image to compare
//   const testImagePath = './sample/image.png';
//   try {
//     const test = Buffer.from(readFileSync(testImagePath)).toString('base64');

//     const resImage = await client.graphql.get()
//       .withClassName('Meme')
//       .withFields(['image', 'text', '_additional {certainty}'])
//       .withNearImage({ image: test })
//       .withLimit(3) // Get top 3 similar images
//       .do();

//     const results = resImage.data.Get.Meme;
//     results.forEach((result, index) => {
//       const outputPath = `./result/result_${index + 1}.jpg`;
//       writeFileSync(outputPath, result.image, 'base64');
//       console.log(`🖼️ Similar image ${index + 1}: ${result.text} (certainty: ${result._additional.certainty.toFixed(4)})`);
//     });
//   } catch (err) {
//     console.error('⚠️ Test image not found or failed to query:', err.message);
//   }
// })();







// import weaviate from 'weaviate-ts-client';
// import { readdirSync, readFileSync, writeFileSync } from 'fs';
// import path from 'path';

// const client = weaviate.client({
//   scheme: 'http',
//   host: 'localhost:8080',
// });

// // Check if 'Meme' class exists
// const existingSchema = await client.schema.getter().do();
// const memeClassExists = existingSchema.classes?.some(c => c.class.toLowerCase() === 'meme');

// if (!memeClassExists) {
//   const schemaConfig = {
//     class: 'Meme',
//     vectorizer: 'img2vec-neural',
//     vectorIndexType: 'hnsw',
//     moduleConfig: {
//       'img2vec-neural': {
//         imageFields: ['image']
//       }
//     },
//     properties: [
//       {
//         name: 'image',
//         dataType: ['blob']
//       },
//       {
//         name: 'text',
//         dataType: ['string']
//       }
//     ]
//   };

//   await client.schema
//     .classCreator()
//     .withClass(schemaConfig)
//     .do();
//   console.log('Class "Meme" created successfully.');
// } else {
//   console.log('Class "Meme" already exists. Skipping creation.');
// }

// //  Upload all images
// const folderPath = './img/';
// const imageFiles = readdirSync(folderPath).filter(file =>
//   /\.(jpg|jpeg|png)$/i.test(file)
// );

// for (const file of imageFiles) {
//   const imgPath = path.join(folderPath, file);
//   const img = readFileSync(imgPath);
//   const b64 = Buffer.from(img).toString('base64');

//   await client.data.creator()
//     .withClassName('Meme')
//     .withProperties({
//       image: b64,
//       text: file
//     })
//     .do();

//   console.log(`✅ Uploaded ${file}`);
// }

// //  Pick a test image to compare 
// const testImagePath = './sample/test.jpg';
// try {
//   const test = Buffer.from(readFileSync(testImagePath)).toString('base64');

//   const resImage = await client.graphql.get()
//     .withClassName('Meme')
//     .withFields(['image', 'text'])
//     .withNearImage({ image: test })
//     .withLimit(1)
//     .do();

//   const result = resImage.data.Get.Meme[0];
//   writeFileSync('./result/result.jpg', result.image, 'base64');
//   console.log(`🖼️ Most similar image is: ${result.text}`);
// } catch (err) {
//   console.error('⚠️ Test image not found or failed to query:', err.message);
// }









// // import weaviate from 'weaviate-ts-client';
// // import { readFileSync, writeFileSync } from 'fs';

// // const client = weaviate.client({
// //     scheme: 'http',
// //     host: 'localhost:8080',
// // });

// // // Check if 'Meme' class exists
// // const existingSchema = await client.schema.getter().do();
// // const memeClassExists = existingSchema.classes?.some(c => c.class.toLowerCase() === 'meme');

// // if (!memeClassExists) {
// //     // Define and create schema if not exists
// //     const schemaConfig = {
// //         class: 'Meme',
// //         vectorizer: 'img2vec-neural',
// //         vectorIndexType: 'hnsw',
// //         moduleConfig: {
// //             'img2vec-neural': {
// //                 imageFields: ['image']
// //             }
// //         },
// //         properties: [
// //             {
// //                 name: 'image',
// //                 dataType: ['blob']
// //             },
// //             {
// //                 name: 'text',
// //                 dataType: ['string']
// //             }
// //         ]
// //     };

// //     await client.schema
// //         .classCreator()
// //         .withClass(schemaConfig)
// //         .do();
// //     console.log('Class "Meme" created successfully.');
// // } else {
// //     console.log('Class "Meme" already exists. Skipping creation.');
// // }

// // // Upload Image
// // const img = readFileSync('./img/data');
// // const b64 = Buffer.from(img).toString('base64');

// // await client.data.creator()
// //   .withClassName('Meme')
// //   .withProperties({
// //     image: b64,
// //     text: 'matrix meme'
// //   })
// //   .do();

// // // Query for Similar Image
// // const test = Buffer.from(readFileSync('./test.jpg')).toString('base64');

// // const resImage = await client.graphql.get()
// //   .withClassName('Meme')
// //   .withFields(['image'])
// //   .withNearImage({ image: test })
// //   .withLimit(1)
// //   .do();

// // const result = resImage.data.Get.Meme[0].image;
// // writeFileSync('./result.jpg', result, 'base64');
