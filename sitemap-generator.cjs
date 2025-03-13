const sitemapGenerator = require("react-router-sitemap");
const Sitemap = sitemapGenerator.default;

const routes = [
    "/",
    "/signup",
    "/signin",
    "/forgot-password",
    "/reset-password",
    "/email-verification",
    "/email-verification-sent",
    "/email-verification-success",
    "/email-verification-failure",
];

const sitemap = new Sitemap(routes.map(route => ({ path: route }))) // Ensure paths are formatted properly
  .build("https://learni-fyai.web.app")
  .save("./public/sitemap.xml");

console.log("✅ Sitemap successfully created!");
