import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Video Editor
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create amazing videos with AI-powered features. Remove background
            noise, generate subtitles, and edit with professional tools.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              ✂️
            </div>
            <h3 className="text-lg font-semibold mb-2">Video Editing</h3>
            <p className="text-gray-600">
              Trim, join, and split videos with ease
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              🎙️
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Audio Cleanup</h3>
            <p className="text-gray-600">
              Remove background noise automatically
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              📝
            </div>
            <h3 className="text-lg font-semibold mb-2">Auto Subtitles</h3>
            <p className="text-gray-600">
              Generate subtitles with AI transcription
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
