const fs = require('fs');
const path = require('path');

const createTestImage = () => {
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');

    // Create fixtures directory if it doesn't exist
    const fixturesDir = path.dirname(testImagePath);
    if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create a minimal valid JPEG file
    const minimalJpeg = Buffer.from([
        0xFF, 0xD8, // SOI marker
        0xFF, 0xD9  // EOI marker
    ]);

    fs.writeFileSync(testImagePath, minimalJpeg);
    return testImagePath;
};

module.exports = createTestImage; 