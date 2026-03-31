import RequestForm from "@/components/RequestForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col">
      {/* 1, 2. max-w 제한 삭제, 헤더 및 하단 선 제거 */}
      <div className="flex-grow flex flex-col w-full relative">
        <RequestForm />
      </div>
    </main>
  );
}