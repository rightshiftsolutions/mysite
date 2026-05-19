const fs = require("fs-extra");

const path = require("path");

const Handlebars = require("handlebars");

const {
  uploadFileToGithub,
} = require("./githubService");

const {
  generateQRCode,
} = require("./qrService");

const {
  generateVCF,
} = require("../utils/vcfGenerator");

const slugify =
  require("../utils/slugify");

async function generateDigitalCard(
  user,
  cardData
) {

  const gymFolder = slugify(
    user
  );

  /*
    TEMPLATE
  */

  const templatePath = path.join(
    __dirname,
    "../templates/gym-template.hbs"
  );

  const templateContent =
    await fs.readFile(
      templatePath,
      "utf8"
    );

  const template =
    Handlebars.compile(
      templateContent
    );

  /*
    GENERATE HTML
  */

  const html = template(cardData);

  /*
    CSS
  */

  const styleCss =
    await fs.readFile(
      path.join(
        __dirname,
        "../templates/style.css"
      ),
      "utf8"
    );

  /*
    JS
  */

  const appJs =
    await fs.readFile(
      path.join(
        __dirname,
        "../templates/app.js"
      ),
      "utf8"
    );

  /*
    HTML
  */

  await uploadFileToGithub({
    filePath:
      `${gymFolder}/index.html`,

    content: html,

    message: "Generate HTML",
  });

  /*
    CSS
  */

  await uploadFileToGithub({
    filePath:
      `${gymFolder}/style.css`,

    content: styleCss,

    message: "Generate CSS",
  });

  /*
    JS
  */

  await uploadFileToGithub({
    filePath:
      `${gymFolder}/app.js`,

    content: appJs,

    message: "Generate JS",
  });

  /*
    PUBLIC URL
  */

  const publicUrl =
    `${process.env.GITHUB_BASE_URL}/${gymFolder}/`;

  /*
    QR
  */

  const qrBuffer =
    await generateQRCode(
      publicUrl
    );

  await uploadFileToGithub({
    filePath:
      `${gymFolder}/qr.png`,

    content: qrBuffer,

    message: "Upload QR",
  });

  /*
    CONTACT VCF
  */

/*
  VCF PUBLIC URL
*/

const vcfUrl =
  `${process.env.GITHUB_BASE_URL}/${gymFolder}/`;

/*
  CONTACT VCF
*/

const vcfContent = generateVCF({

  businessName:
    cardData.businessName,

  description:
    cardData.description,

  phone:
    `+91${cardData.contact?.phone || ""}`,

  email:
    cardData.contact?.email,

  address:
    cardData.contact?.address,

  website:
    vcfUrl

}); 

  await uploadFileToGithub({

    filePath:
      `${gymFolder}/contact.vcf`,

    content: vcfContent,

    message: "Upload VCF",

  });

  return publicUrl;
}

module.exports = {
  generateDigitalCard,
};