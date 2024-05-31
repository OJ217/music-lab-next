# Music Lab

Music Lab is web application that offers personalized space for practice professional music subjects (ear training, music theory, music history, and much more)

### Table of Contents

-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Coding Convention](#coding-convention)
-   [SRC Directory Guide](#src-directory-guide)
-   [Features Directory Duide](#features-directory-guide)
-   [Deployment](#deployment)
-   [Troubleshooting Deployment Builds](#troubleshooting-deployment-builds)
-   [VS Code Extensions and Development Plugions](#vs-code-extensions-and-development-plugins)
-   [Useful Resources](#useful-resources)

## Prerequisites

Before you begin, ensure you have met the following requirements:

-   🍀 Node.js: Make sure you have Node.js installed. You can download it from the [official download page](https://nodejs.org/en/download/current) or use tools like [homebrew](https://brew.sh/) 🍻 if you are using MacOS machine

-   📦 Package manager: Select one of these package managers - [npm](https://www.npmjs.com/) /installed automatically with Node.js/, [yarn](https://yarnpkg.com/), and [pnpm](https://pnpm.io/)

> ☢️ ☢️ ☢️ There is also another option called [bun](https://bun.sh/), a comprehensive toolkit for javascript and typescript. However, I do not recommend it at the moment as it's `fresh out of the oven` /pun intended/ and have some bugs related to the package manager.

-   Development tooling: See [here](#vs-code-extensions-and-development-plugins) for more information on development tools related to this project

## Installation

To get the project up and running on your local machine, follow these steps:

First, run the development server:

1. Clone the repository

```bash
git clone https://github.com/OJ217/music-lab-next
```

2. Navigate to the project directory:

```bash
cd music-lab-next
```

3. Install dependencies with your preferred package manager

```bash
npm install
# or
yarn install
# or
pnpm install
```

4. Get environment variables and place them in .env.local file

```
NEXT_PUBLIC_API_URL = ____
NEXT_PUBLIC_API_URL_LOCAL = ____
NEXT_PUBLIC_WEB_APP_URL = ____
NEXT_PUBLIC_WEB_APP_URL_LOCAL = ____
NEXT_PUBLIC_GOOGLE_CLIENT_ID = ____
...
```

5. Run the development server and `Happy Coding ☺️`

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## `src` directory guide

-   📦 `common` — common elements used throughout the application /components, HOCs (higher order components other than layout), icons .../

-   ⚙️ `config` — configuration files for third party libraries /axios interceptor and predefined api client (for server request), mantine provider, react query provider.../

-   📘 `constants` — constant values and enums /do not place any types or interfaces in this directory/

-   🗃️ `context` — context APIs used throughout the application /e.g. Auth context for managing user authentication/

-   📦 `features` — contains all the main features of the application ([See here for `features` directory guide](#features-directory-guide))

-   📑 `pages` — application pages / routing handled by Next JS file-system based routing /Content of the page file must be imported from `@/features/[feature_name]/views` directory

-   🎨 `styles` — global css styles

-   🧩 `types` — common types and interfaces /Currently, there are only API response types/

-   🛠️ `utils` — utility functions reused for throughout the application /utility function file should be categorized by responsibility and it is recommmended to name the file with `.util` segment (e.g. utility functions in cookie.util.ts file are responsible for managing cookies)/

## `features` directory guide

This is directory contains the `main features` of the application and is divided into several sub-features depending on the application needs. Furthermore, the sub-feature itself has several conventional sub-directories that have their own specific responsibilities.

-   👷 `components` — contains components only used witing this specific feature of the component /There are few reasons to separate an UI Element into a component file. 1. The element is used in number of places within the feature, 2. The element contains complex functionalities and needs to refactored into a component./

-   🖼️ `layouts` — `common layout HOCs` that wraps page views of the feature /e.g. Dashboard layout, Auth layout .../

-   🛜 `services` — api services called within the specific feature that are modularized into subdirectories /e.g. services can be divided into subdirectories such as `auth`, `ear-training-session`and more/... This application uses React Query with Axios to make API calls. So, query and mutation hooks are separated into their own files.

```ts
// example.query.ts
interface IUseExampleListParams {
	enabled?: boolean;
	listPagination?: IListPagination;
	documentStatus?: DocumentStatusFilter;
}

export const useExampleListQuery = ({ listPagination = defaultListPagination, enabled = false, documentStatus }: IUseExampleListParams = {}) => {
	const fetchExampleList = async () => {
		const exampleListResponse = await axios.post<IResponse<IList<IExampleDocument>>>(`/examples/list${documentStatus ? `?status=${documentStatus}` : ''}`, listPagination, {
			isPrivate: true
		});
		return exampleListResponse?.data?.data;
	};

	const {
		data: exampleList,
		isLoading: exampleListLoading,
		isFetching: fetchingLinkList,
		isError: exampleError
	} = useQuery({
		queryKey: ['example', 'list', { documentStatus, listPagination }],
		queryFn: fetchExampleList,
		staleTime: Infinity,
		enabled
	});

	return {
		exampleList,
		fetchingLinkList,
		exampleListLoading,
		exampleError
	};
};
```

-   📄 `views` — page view that is associated with specific route of the feature. /The view is then imported in that route within the `src/pages` directory. Below is an example./

-   🛠️ `utils` — utility functions reused for the feature /utility function file should be categorized by responsibility and it is recommmended to name the file with `.util` segment/

-   🎣 `hooks` — reusable hooks for the specific feature /hook function file should be categorized by responsibility and it is recommmended to name the file with `.util` segment/

```tsx
import { ExampleView } from '@/features/example/views';

const Example = () => {
	return <ExampleView />;
};

export default Example;
```

## Deployment

This application is deployed on Vercel with CI/CD workflows configured automatically. To request a deploy, deploy to `dev` or `main` according to your needs

**_pull request link_**, @**_Assignees_**

## Troubleshooting Deployment Builds

Here are some common problems regarding the deployment and how to fix them

-   Runtime errors during the build - Build the project on your local development environment and fix the occuring errors
-   `.lock` files not persisted - Download the dependencies with each package managers and persist the .lock files

Here is build command:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## VS Code Extensions and Development Plugins

-   [prettier](https://prettier.io/) - An opinionated code formatter that upports many languages and integrates with most editors
-   [typescript-import-sorter](https://marketplace.visualstudio.com/items?itemName=mike-co.import-sorter) - Extension that sorts Typescript imports.
-   [better-comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) - Extension that highlights comments annotated with alert, informational, TODOs, and more
-   [prettier-plugin-tailwindcss](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier):
    > This plugin scans your templates for class attributes containing Tailwind CSS classes, and then sorts those classes automatically following our recommended class order.

Above extensions are recommended and configured in the `.vscode` directory. You can change the configuration options if it is needed.

## Useful Resources

-   [React.js Documentation](https://react.dev/reference/react) - The library for web and native user interfaces
-   [Next.js Documentation](https://nextjs.org/docs) - React framework for building full-stack web applications
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs/installation) - Open source CSS framework.
-   [Mantine Documentation](https://mantine.dev/) - Fully-featured react component library.
-   [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview) - A data-fetching and state management library for React applications that simplifies fetching, caching, and updating data
-   [Axios Interceptors Documentation](https://axios-http.com/docs/interceptors) - Axios feature for intercepting API call requests and responses
-   [Zod Documentation](https://zod.dev/) - TypeScript-first schema validation with static type inference.
-   [Day JS Documentation](https://day.js.org/) - Fast 2kB alternative to Moment.js with the same modern API
