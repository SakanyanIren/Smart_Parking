/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "parking-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const supabaseUrl = new sst.Secret("SupabaseUrl");
    const supabaseAnonKey = new sst.Secret("SupabaseAnonKey");

    const site = new sst.aws.StaticSite("ParkingApp", {
      build: {
        command: "npm run build",
        output: "dist",
      },
      environment: {
        VITE_SUPABASE_URL: supabaseUrl.value,
        VITE_SUPABASE_ANON_KEY: supabaseAnonKey.value,
      },
      // React Router needs all routes to serve index.html
      errorPage: "index.html",
    });

    return {
      url: site.url,
    };
  },
});
