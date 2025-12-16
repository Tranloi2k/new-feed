import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import CreatePost from "./components/CreatePost";
import Post from "./components/Post";

export default function Home() {
  const posts = [
    {
      author: "Nguyễn Văn A",
      time: "2 giờ trước",
      content: "Hôm nay thật là một ngày tuyệt vời! 🌟",
      image: true,
    },
    {
      author: "Trần Thị B",
      time: "5 giờ trước",
      content:
        "Chia sẻ một số tips học lập trình hiệu quả cho những bạn mới bắt đầu. Hãy kiên trì và không ngại thất bại nhé! 💪",
    },
    {
      author: "Lê Văn C",
      time: "1 ngày trước",
      content: "Vừa hoàn thành dự án mới! Cảm ơn team đã hỗ trợ tuyệt vời 🎉",
      image: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <LeftSidebar />
      <RightSidebar />

      {/* Main Feed */}
      <main className="pt-16 lg:pl-64 xl:pr-64">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <CreatePost />
          {posts.map((post, index) => (
            <Post
              key={index}
              author={post.author}
              time={post.time}
              content={post.content}
              image={post.image ? "/placeholder.jpg" : undefined}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
