const fs = require("fs");
const http = require("http");

const orderId = "ead29c5c-d373-4155-94cd-1fe22a531a34";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZmM4OTJiNS1kYTA5LTQ1YjItOTBhNi04MzVkMmEyNWYzMWUiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU4NjQ2MzcyfQ.x_MJlU2fLMi8GBHtq6RmMR02DUEAsLE8kyWR9Ihr3TA"; // <-- replace with a valid token

function request(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3009,
      path,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, body: Buffer.concat(data) });
      });
    });

    req.on("error", (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    // 1️⃣ Generate invoice
    console.log("Generating invoice...");
    const genRes = await request(`/api/invoices/${orderId}/generate`, "POST");
    if (genRes.statusCode !== 200 && genRes.statusCode !== 201) {
      console.error("Failed to generate invoice:", genRes.body.toString());
      return;
    }
    console.log("Invoice generated successfully.");

    // 2️⃣ Download invoice
    console.log("Downloading invoice...");
    const downloadRes = await request(`/api/invoices/${orderId}/download`, "GET");
    if (downloadRes.statusCode !== 200) {
      console.error("Failed to download invoice:", downloadRes.body.toString());
      return;
    }

    fs.writeFileSync(`invoice-${orderId}.pdf`, downloadRes.body);
    console.log(`Invoice saved as invoice-${orderId}.pdf`);
  } catch (err) {
    console.error("Error:", err);
  }
})();

// node download-invoice.js