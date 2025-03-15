export default function Home() {
  return (
    <div>
      <section className="relative h-screen bg-radial from-secondary/30 to-transparent">
        <figure
          className="bg-[url(/logo-bg.png)] absolute inset-0 animate-bg-infinite-scroll"
          style={{
            backgroundSize: "124px",
          }}
        >
          <figure className="absolute inset-0 bg-radial from-transparent to-70% to-background" />
        </figure>
      </section>
    </div>
  );
}
