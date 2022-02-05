import { AppProps } from 'next/dist/shared/lib/router/router'

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <div className="container">
                <Component {...pageProps} />
            </div>

            <style jsx>{`
                .container {
                    min-height: 100vh;
                }
            `}</style>

            <style global jsx>{`
                body,
                html {
                    margin: 0;
                    min-height: 100vh;
                    padding: 0;
                }
            `}</style>
        </>
    )
}

export default App
