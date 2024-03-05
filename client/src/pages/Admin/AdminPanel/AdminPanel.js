import Layout from "../../../components/Layout/Layout";
import ServiceInfo from "../../../components/ServiceInfo/ServiceInfo";
function AdminPanel() {
  return (
    <Layout>
      <div className="d-flex flex-column justify-content-between">
        <h1 className="page-title">Panel Administracji</h1>
        <div className="d-flex flex-column align-items-center">
          <div className="d-flex flex-column align-items-center justify-content-between mt-5">
            <h2 style={{ color: "black" }}>Witaj administratorze! 🤓</h2>
            <h4
              style={{
                color: "black",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              <q>Pamiętaj! Z wielką mocą wiąze się wielka odpowiedzialność.</q>
            </h4>
          </div>
          <ServiceInfo></ServiceInfo>
        </div>
      </div>
    </Layout>
  );
}

export default AdminPanel;
