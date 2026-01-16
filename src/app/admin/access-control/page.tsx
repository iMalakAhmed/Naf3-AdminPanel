import { redirect } from "next/navigation";

export default function AccessControlRedirect() {
  redirect("/admin/partners");
}
