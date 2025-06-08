"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
const accountLinks = [
  { href: "/my-account", label: "Dashboard" },
  { href: "/my-account-orders", label: "Orders" },
  { href: "/my-account-address", label: "Addresses" },
  { href: "/my-account-edit", label: "Account Details" },
  { href: "/my-account-wishlist", label: "Wishlist" },
  { href: "/my-account-reviews",label: "My Reviews" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default link behavior
    const auth = getAuth();
    await signOut(auth);
    router.push("/"); // Redirect to home after logout
  };
  return (
    <ul className="my-account-nav">
      {accountLinks.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className={`my-account-nav-item ${
              pathname == link.href ? "active" : ""
            }`}
          >
            {link.label}
          </Link>
        </li>
      ))}
      <li>
        <a href="#" onClick={handleLogout} className="my-account-nav-item">
          Logout
        </a>
      </li>
    </ul>
  );
}
