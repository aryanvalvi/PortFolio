import AdminDashboard from "@/components/admin/AdminDashboard"
import Container from "@/components/container"

export default function AdminPage() {
  return (
    <Container className="min-h-screen px-4 pb-12 pt-24 md:px-8 md:pb-16 md:pt-32">
      <AdminDashboard />
    </Container>
  )
}
