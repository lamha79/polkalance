import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Dropdown, Navbar, Avatar, Button } from 'flowbite-react'
import { useInkathon } from '@scio-labs/use-inkathon'
import { ConnectButton } from '@/components/web3/ConnectButton'

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const {
    activeAccount
  } = useInkathon()

  const AvatarRender = (imgURL: string) => <Avatar alt="User settings" img={imgURL} rounded />

  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="/">
        <img alt="Flowbite React Logo" className="mr-3 h-6 sm:h-9" src="/Logo.png" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Rocket NextJs
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <ConnectButton />
        {!activeAccount &&
        (
          <a href={`/signup`}>
            <Button>Sign Up</Button>
          </a>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Link href="/" className={pathname === '/' ? 'text-yellow-700' : ''}>
          Home
        </Link>
        <Link href="/about" className={pathname === '/about' ? 'text-yellow-700' : ''}>
          About
        </Link>
        <Link href="/">Services</Link>

        <Link href="/createjob" className={pathname === '/protected' ? 'text-yellow-700' : ''}>
          Create Job
        </Link>
        <Link href="/searchjobs" className={pathname === '/protected' ? 'text-yellow-700' : ''}>
          Search Job
        </Link>
        <Link href="/protected" className={pathname === '/protected' ? 'text-yellow-700' : ''}>
          Protected Page
        </Link>
      </Navbar.Collapse>
    </Navbar>
  )
}
