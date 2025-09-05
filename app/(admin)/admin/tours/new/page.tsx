// Note: prisma not used here; keep import minimal

export default async function AdminNewTourPage() {
  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Tạo tour mới</h2>
      <form action="/admin/tours/new/action" method="post" className="space-y-3" encType="multipart/form-data">
        <input name="title" required placeholder="Tiêu đề" className="w-full border rounded px-3 py-2" />
        <textarea name="description" required placeholder="Mô tả chi tiết lịch trình, hoạt động..." className="w-full border rounded px-3 py-2" />
        <input name="slug" required placeholder="Slug (không dấu, nối bằng -)" className="w-full border rounded px-3 py-2" />
        <input name="basePrice" type="number" required placeholder="Giá cơ bản (VND)" className="w-full border rounded px-3 py-2" />
        <div>
          <label className="text-sm text-gray-600">Hình ảnh đại diện</label>
          <input name="imageFile" type="file" accept="image/*" required className="w-full border rounded px-3 py-2 mt-2" />
        </div>
        <button className="bg-black text-white rounded px-4 py-2">Tạo</button>
      </form>
    </div>
  );
}
