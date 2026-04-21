import AKGPage from "./AKGPage";
import Layout  from "../components/Sidebar";

export default function Dashboard({ user }) {
  return (
     <Layout user={user}>
      <h2 className="text-2xl font-bold mb-4">Dashboard AKG</h2>
      <p>Selamat datang di admin dashboard</p>
    </Layout>
  );
}