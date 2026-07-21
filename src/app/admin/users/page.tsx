import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { auth } from "@/lib/auth"
import AdminUserForm from "./AdminUserForm"
import DeleteButton from "../DeleteButton"

export default async function AdminUsersPage() {
  const session = await auth()
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Kullanıcılar</h1>

      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="font-semibold text-stone-800 mb-4">Yeni Admin Ekle</h2>
        <AdminUserForm />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left p-3 font-medium text-stone-600">İsim</th>
                <th className="text-left p-3 font-medium text-stone-600">E-posta</th>
                <th className="text-left p-3 font-medium text-stone-600">Rol</th>
                <th className="text-left p-3 font-medium text-stone-600">Kayıt</th>
                <th className="text-right p-3 font-medium text-stone-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="p-3 font-medium text-stone-800">{user.name || "-"}</td>
                  <td className="p-3 text-stone-500">{user.email}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      user.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"
                    }`}>
                      {user.role === "ADMIN" ? "Admin" : "Müşteri"}
                    </span>
                  </td>
                  <td className="p-3 text-stone-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="p-3 text-right">
                    {user.id !== session?.user?.id && (
                      <DeleteButton endpoint={`/api/users?id=${user.id}`} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
