import Link from 'next/link'

const IndexPage = () => {
    return (
        <div className="container">
            <h1 className="title">Index of cs7gvX-webgl</h1>
            <ul className="list">
                <li className="list-item">
                    <Link href="/cs7gv3/transmittance">CS7GV3 Assignment 2: Transmittance Effects</Link>
                </li>
                <li className="list-item">
                    <Link href="/cs7gv5/hello-triangle">CS7GV5 Tutorial: Hello Triangle</Link>
                </li>
                <li className="list-item">
                    <Link href="/cs7gv5/propeller">CS7GV5 Assignment 1: Propeller</Link>
                </li>
            </ul>

            <style jsx>{`
                .container {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    margin: 0 auto;
                    max-width: 48em;
                }

                .title {
                    font-size: 1.5em;
                }

                .list {
                    margin: 2em 0;
                }

                .list-item {
                    margin: 1.5em 0;
                }
            `}</style>
        </div>
    )
}

export default IndexPage
