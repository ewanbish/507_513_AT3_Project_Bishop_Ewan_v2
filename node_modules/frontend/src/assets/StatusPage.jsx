import { useNavigate } from "react-router";

function StatusPage() {
  const navigate = useNavigate();

  const authKey = localStorage.getItem("auth-key");

  return (
    <section className="flex flex-col items-center justify-center">
      <div className="mt-8">
        <div className="inline-grid *:[grid-area:1/1] mr-4">
          <div className="status status-error animate-ping"></div>
          <div className="status status-error"></div>
        </div>

        {authKey
          ? "User not permitted to access this resource"
          : "User is not authenticated"}
      </div>

      <button
        className="btn btn-error mt-8"
        onClick={() => (authKey ? navigate("/blog") : navigate("/"))}
      >
        Go Back
      </button>
    </section>
  );
}

export default StatusPage;
