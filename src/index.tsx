import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-8">What can I help with?</h1>
        <div className="grid grid-cols-2 gap-4">
          <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Create image</button>
          <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Brainstorm</button>
          <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Help me write</button>
          <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Summarize text</button>
        </div>
      </div>
    </Layout>
  )
}