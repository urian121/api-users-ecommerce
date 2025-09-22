import Image from "next/image";

export default function Home() {
  return (
      <main className="center-content">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <p>API User Ecommerce</p>
        Desarrollada por: Urian Viera
      </main>
  );
}
