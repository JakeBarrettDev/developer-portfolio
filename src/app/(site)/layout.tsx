import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

/** Site chrome for every page except the bare Lab sandbox. */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
