"use client"

import Image from 'next/image'
import ReactDOM from "react-dom/client";
import { APP_NAME, PROBLEMS } from '@/lib/statics/appConstants';
import Logo from './components/logo';
import Header from './components/header';
import { useRouter } from "next/router"
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <Header selectedPage={'home'}></Header>
      <div className="flex flex-col items-center h-full">
        <div className="container bg-primary-50/50 dark:bg-primary-950/50">
          <div className="flex flex-col items-center my-8">
            <Logo height={150}></Logo>
            <h1 className="text-4xl font-bold mt-8">The AI Algorithm Visualization Tool</h1>
          </div>
          <div className="flex flex-row justify-center gap-8">
            {Object.keys(PROBLEMS).map(problemId => {
              const problem = PROBLEMS[problemId];
              return (
                <div key={problemId} className="flex flex-col items-center">
                  <h2 className="text-2xl font-semibold">{problem.name}</h2>
                  <p className="text-sm opacity-50">Explore {problem.name} algorithms</p>
                  <a
                    href={problem.href}
                    className="group rounded-lg border border-transparent px-5 pt-4 pb-1 mt-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                  >
                    <h2 className={`mb-3 text-2xl font-semibold`}>
                      Go{' '}
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -&gt;
                      </span>
                    </h2>
                  </a>
                </div>
              )
            })}
          </div>
          <div className="flex flex-col my-8 ml-4">
            <h2 className="text-2xl font-semibold">Documentation</h2>
            <p>If you are a programmer, you can make your own custom cases and algorithms to use here! Check out the <Link className="underline" href="/docs/">documentation</Link> page and look around if you ever need clarification.</p>
          </div>
          <div className="flex flex-col items-left my-8 ml-4">
            <h2 className="text-2xl font-semibold">Usage Guide</h2>
            <p>You might be wondering how exactly this tool works. Well, it differs slightly from problem to problem, but here is the gist!</p>
            <Image className="self-center my-4 max-w-[75vw] min-w-[65vw]" src="/ClairvoyantUIGuide.png" alt="Clairvoyant UI Guide" width={1200} height={800} />
            <p>First and foremost, you can see the <span className="font-bold">header</span> at the top <span className="text-tertiary-900 dark:text-tertiary-100">(1)</span>, this is where you can access the main pages for all problems. This is common among all pages in {APP_NAME}.</p>
            <p>What lies below is the <span className="font-bold">problem window</span>, composed of 
              the <span className="font-bold">algorithm editor</span>  <span className="text-tertiary-900 dark:text-tertiary-100">(2)</span>,
              the <span className="font-bold">case editor</span>       <span className="text-tertiary-900 dark:text-tertiary-100">(3)</span>, and
              the <span className="font-bold">solution viewport</span> <span className="text-tertiary-900 dark:text-tertiary-100">(4)</span>.
              We will dive deeper into those components in the following sections. But here is the basic idea: 
              your algorithm (typically in JavaScript) will go into the algorithm editor, 
              the case editor allows you to control the input to your algorithm; for example, 
              for the graph search problem, the case editor controls the graph.
              Lastly, the solution viewport will visually display the case, with some data provided by your algorithm once you run it.
              Some problems allow you to visually edit the case in the solution viewport.</p>
            <p>Additionally, each of this components is resizable! You can drag the dividers between the components to resize them to your liking.</p>
            <h3 className="text-xl font-semibold mt-4">Algorithm Editor <span className="text-tertiary-900 dark:text-tertiary-100">(2)</span></h3>
            <p>The algorithm editor is where you will be able to write code to tell the program exactly how the case is supposed to be solved. 
              Once you are happy with your solution, click the <span className="text-secondary-800 dark:text-secondary-200">Run</span> button above
              to execute your algorithm on the active case. <span className="text-danger-800 dark:text-danger-200">Be careful with loops!</span> long-running code can cause the application to hang.
              If this happens, you will likely have to forcefully reload the application.</p>
            <p>You don&apos;t have to write the code just to see how it works, problems come with default algorithms and cases for you to play around with and see how they work. You can select these from the dropdown menu above the editor.
              That said, you are heavily encouranged to try and write your own algorithms to solve the problems. If you are confused about how certain functions work, documentation is available by clicking on 
              the <span className="text-secondary-800 dark:text-secondary-200">Docs</span> button above the editor (labelled with a scroll).</p>
            <h3 className="text-xl font-semibold mt-4">Case Editor <span className="text-tertiary-900 dark:text-tertiary-100">(3)</span></h3>
            <p>The case editor is where you will control the input to your algorithm. For example, in the graph search problem, you can control the graph in the case editor.</p>
            <p>Much like with the algorithm editor, you can pick from one of many default cases provided to you for each problem. The way in which cases are expressed depends heavily on the problem.
              But you should be able to get a general sense of how it works form the examples, most of the time; you should be able to either use the default cases relatively easily or modify the case using the solution viewport.</p>
            <p>Additionally, for convenience, if you would like to export the case, you can press the <span className="text-secondary-800 dark:text-secondary-200">Copy to Clipboard</span> button on the top right of the editor and save it locally.</p>
            <h3 className="text-xl font-semibold mt-4">Solution Viewport <span className="text-tertiary-900 dark:text-tertiary-100">(4)</span></h3>
            <p>The solution viewport is where you will see the output of your algorithm. Typically, you will be able to see a visual representation of the case, 
              along with some extra controls to visualize your solution or play around with the problem. You may also spot <span className="font-bold">property inspectors</span> <span className="text-tertiary-900 dark:text-tertiary-100">(5)</span> around the viewport,
              these are helpful, generic ways to inspect the properties of certain components of the case and potentially alter them.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
  /*
  return (
    <main>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {Object.keys(PROBLEMS).map(problemId => {
            const problem = PROBLEMS[problemId];
            return (
              <Route path={problem.href} element={problem.element} key={problemId}></Route>
            )
          })}
        </Routes>
      </Router>
    </main>
  )*/
  /*
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  )*/
}
