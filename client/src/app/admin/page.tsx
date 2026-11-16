import AdminDashboard from "@/components/admin/AdminDashboard"
import Container from "@/components/container"

export default function AdminPage() {
  return (
    <Container className="min-h-screen px-4 pb-16 pt-28 md:px-8 md:pb-20 md:pt-36">
      <AdminDashboard />
    </Container>
  )
}
