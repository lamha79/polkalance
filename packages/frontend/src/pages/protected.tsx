import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

import Head from 'next/head'
import Layout from "@/components/layout"
import AccessDenied from "@/components/access-denied"

export default function IndexPage() {
    const { data: session } = useSession()
    const [content, setContent] = useState()

    // Fetch content from protected route
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/protected")
            const json = await res.json()
            if (json.content) {
                setContent(json.content)
            }
        }
        fetchData()
    }, [session])

    return (
        <Layout>
            <Head>
                <title>Protected Page</title>
            </Head>
            {!session && <AccessDenied />}
            {
                session &&
                <section className='text-center py-10'>
                    <p>{content ?? ""}</p>
                </section>
            }
        </Layout>
    )
}