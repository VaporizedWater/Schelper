## MongoDB Playground

The validation.mongodb.js script allows you to run a validation test on the classes and class_properties to ensure there is a 1 to 1 relationship. It will generate an error report in the "error" collection, and also print the results to your console. To run this script, you must have MongoDB for VS Code installed, and you need to open the playground in the leaf menu to the left, and click the run button in the upper right on VS Code's navigation bar.

## Next.js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Pre-requisites: 

Install [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

Install nodejs [using nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage)

Clone the repo to a directory and run `npm install`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Troubleshooting:

You may need to delete the node_modules, .next, or package-lock.json directories/files, then run `npm install` again to reinstall all the packages if there are any errors due to dependencies being missing or misconfigured.

If you have non-descriptive errors relating to "webpack", then best solution is to uninstall and manually remove all references to node, npm, nvm from your installation location, and begin again with the prerequisites above.
