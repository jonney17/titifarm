import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="relative h-[60vh] min-h-[360px] w-full overflow-hidden rounded-md">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-2xl px-6">
            <h1 className="text-white text-3xl md:text-5xl font-semibold">TitiFarm – Nông trại trải nghiệm cho gia đình</h1>
            <p className="text-white/90 mt-3 md:text-lg">Đến TitiFarm để cho trẻ học làm nông, gần gũi thiên nhiên và vui chơi an toàn.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/tours" className="bg-white text-black rounded px-5 py-2 font-medium">Đặt vé tham quan</Link>
              <Link href="/login" className="border border-white text-white rounded px-5 py-2 font-medium">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">Thông tin nổi bật</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Khu vườn rau hữu cơ",
              desc: "Tự tay thu hoạch và học về nông nghiệp sạch.",
              img: "https://picsum.photos/seed/farm-garden/800/500",
            },
            {
              title: "Khu chuồng trại",
              desc: "Cho bò, dê, thỏ ăn dưới sự hướng dẫn an toàn.",
              img: "https://picsum.photos/seed/farm-animals/800/500",
            },
            {
              title: "Khu vui chơi trẻ em",
              desc: "Khu vận động và trò chơi sáng tạo ngoài trời.",
              img: "https://picsum.photos/seed/farm-play/800/500",
            },
            {
              title: "Xưởng làm bánh",
              desc: "Trải nghiệm làm bánh từ nông sản tại trại.",
              img: "https://picsum.photos/seed/farm-bakery/800/500",
            },
            {
              title: "Tour giáo dục cuối tuần",
              desc: "Lịch trình 1 ngày phù hợp cho cả gia đình.",
              img: "https://picsum.photos/seed/farm-weekend/800/500",
            },
            {
              title: "Workshop theo chủ đề",
              desc: "Tái chế, trồng cây, chăm sóc thú cưng và hơn nữa.",
              img: "https://picsum.photos/seed/farm-workshop/800/500",
            },
          ].map((c, i) => (
            <div key={i} className="border rounded overflow-hidden bg-white/80 backdrop-blur">
              <div className="relative w-full pt-[56.25%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="font-medium">{c.title}</div>
                <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="border rounded p-5">
          <div className="font-semibold">An toàn & Giáo dục</div>
          <p className="text-sm text-gray-600 mt-2">Lịch trình thân thiện cho trẻ, kết hợp học và chơi.</p>
        </div>
        <div className="border rounded p-5">
          <div className="font-semibold">Đặt chỗ nhanh chóng</div>
          <p className="text-sm text-gray-600 mt-2">Chọn ngày, thanh toán trực tuyến, xác nhận tự động.</p>
        </div>
        <div className="border rounded p-5">
          <div className="font-semibold">Nhiều lựa chọn tour</div>
          <p className="text-sm text-gray-600 mt-2">Các gói trải nghiệm đa dạng phù hợp mọi lứa tuổi.</p>
        </div>
      </section>
    </div>
  );
}
