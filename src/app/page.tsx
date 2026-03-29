import Image from "next/image";

export default function Home() {

  const tools = [
    {
      name: "YAML Validator",
      description: "Validate your YAML files for syntax and structure.",
      icon: "bi-check-circle",
      url: "https://yaml-validator.smathr.com"
    },
    {
      name: "JSON Validator",
      description: "Validate your JSON data against a schema.",
      icon: "bi-file-earmark-code",
      url: "https://json-validator.smathr.com"
    },
    {
      name: "GCloud Finisher",
      description: "AI powered gcloud command completion.",
      icon: "bi-google",
      url: "https://gcloud-finisher.smathr.com"
    }
  ];

  return (
    <>
      <header className="bg-dark text-white text-center py-3 mb-5">
        <div className="container">
          <h1 className="display-4">Smathr.com</h1>
        </div>
      </header>

      <main className="container">
        <div className="text-center mb-5">
          <h2 className="display-5">Smart Tools for Data Engineers</h2>
          <p className="lead">A curated collection of web applications to streamline your engineering workflows.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="tool-card-deck">
              {tools.map((tool) => (
                <div key={tool.name} className="card shadow-sm">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className={`bi ${tool.icon} fs-1 text-primary`}></i>
                    </div>
                    <h5 className="card-title">{tool.name}</h5>
                    <p className="card-text text-muted">{tool.description}</p>
                    <a href={tool.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                      Launch Tool
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-muted py-4 mt-5 bg-light">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Smathr.com. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}
