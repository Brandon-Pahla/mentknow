import { NextApiRequest, NextApiResponse } from 'next';
const puppeteer = require('puppeteer');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract noteArray and categoryArray from the request body
  const { noteArray, categoryArray } = req.body;

  console.log("NOTE ARRAY Request:", noteArray)
  console.log("Category ARRAY Request:", categoryArray)

  // Launch a headless browser using the new headless mode
  const browser = await puppeteer.launch({ headless: 'new' });

  // Create a new page
  const page = await browser.newPage();

  // Create PDF content using noteArray and categoryArray
  const htmlContent = `
                      <html>
                      <head>
                        <style>
                          body {
                            font-family: Arial, sans-serif;
                          }
                          h1 {
                            color: blue;
                          }
                          table {
                            border-collapse: collapse;
                            width: 100%;
                            margin-top: 20px;
                          }
                          th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                          }
                          th {
                            background-color: #f2f2f2;
                          }
                        </style>
                      </head>
                      <body>
                        <h1>MENTKNOW Board Notes</h1>
                        
                        <!-- Use noteArray and categoryArray to generate content -->
                        ${categoryArray.map((category: any) => `
                          <h2>${category.tag} ${category.title}</h2>
                          <table>
                            <thead>
                              <tr>
                                <th>Tag</th>
                                <th>Title</th>
                                <th>Text</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${noteArray
                                .filter((note: any) => note.tag === category.tag)
                                .map((note: any) => `
                                  <tr>
                                    <td>${note.tag}</td>
                                    <td>${note.title}</td>
                                    <td>${note.text}</td>
                                  </tr>
                                `)
                                .join('')}
                            </tbody>
                          </table>
                        `).join('')}
                      </body>
                      </html>
`;


  await page.setContent(htmlContent);

  // Generate the PDF in memory
  const pdfBuffer = await page.pdf();

  // Close the browser
  await browser.close();

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=board.pdf');

  // Send the PDF buffer as the response
  res.status(200).send(pdfBuffer);
}
