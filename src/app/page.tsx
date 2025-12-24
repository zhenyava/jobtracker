import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-950 shadow-sm">
        <Link href="#" className="flex items-center justify-center">
          <span className="text-lg font-semibold">Job Tracker SaaS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Log In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    The Ultimate Job Application Tracker
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Stay organized and land your dream job. Our tool helps you
                    manage applications, track progress, and stay on top of
                    your job search.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg">Get Started</Button>
                  </Link>
                </div>
              </div>
              <div className="w-full mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square" />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700">
                  Pricing Plans
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  A plan for every team size
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Choose the plan that's right for you. All plans include our
                  core features.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-sm items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <div className="grid gap-1 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-md">
                <h3 className="text-xl font-bold">Free</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  For individuals and small teams.
                </p>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    / month
                  </span>
                </div>
                <Button className="mt-4 w-full">Choose Plan</Button>
              </div>
              <div className="grid gap-1 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-md">
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  For growing businesses.
                </p>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-bold">$10</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    / month
                  </span>
                </div>
                <Button className="mt-4 w-full">Choose Plan</Button>
              </div>
              <div className="grid gap-1 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-md">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  For large organizations.
                </p>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-bold">$25</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    / month
                  </span>
                </div>
                <Button className="mt-4 w-full">Choose Plan</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center p-6 bg-white dark:bg-gray-950 shadow-inner">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2024 Job Tracker SaaS. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
