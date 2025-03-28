import { signIn } from "@/lib/auth";
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("microsoft-entra-id");
      }}
    >
      <button type="submit">Signin with PSU SSO</button>
    </form>
  );
} 