import { Inter } from "next/font/google";
import { db } from "@/lib/db";
import Button from "@/components/ui/Button";

const inter = Inter({ subsets: ["latin"] });

export default async function Home() {
  // await db.set("helloworld", "helloworld");
  
  return <Button>Hello</Button>
}

