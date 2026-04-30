export function AdminGuard({ children }) {
  const user = getUser() // ambil dari context/firebase

  if (user?.role !== 'admin') {
    return <Navigate to="/app/home" />
  }

  return children
}

export function UserGuard({ children }) {
  const user = getUser()

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}