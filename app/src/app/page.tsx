export default function Home() {
  return (
    <div>
      <section className="relative h-[90vh] bg-radial from-secondary/30 to-transparent">
        <figure
          className="bg-[url(/logo-bg.png)] absolute inset-0 animate-bg-infinite-scroll"
          style={{
            backgroundSize: "124px",
          }}
        >
          <figure className="absolute inset-0 bg-radial from-transparent to-65% to-background" />

          <figure className="absolute bottom-0 left-0 w-full bg-background h-10 translate-y-1/2 blur-lg" /> 
        </figure>

        <div className="relative z-1 w-full h-full flex justify-center items-center flex-col drop-shadow-lg gap-y-5">
          <h2 className="text-6xl text-center font-bold leading-[1.3]">
            Plan and execute NFT pacts on a<br />
            single collaboration platform
          </h2>

          <h3 className="text-foreground/75 text-center">
            Join now and instantly start a chat with whoever you want to
            collaborate with to draft up a deal
            <br />
            We will take care of everything else.
          </h3>

          <div className="flex gap-x-5">
            <button className="w-52 py-2 rounded-lg bg-primary text-primary-foreground font-medium tracking-wider">Explore Celebs</button>
            <button className="w-52 py-2 rounded-lg bg-background border border-primary shadow-[inset_-0.5px_1px_6px_var(--primary)]">Join as a Celeb</button> 
          </div>
        </div>
      </section>
    </div>
  );
}
