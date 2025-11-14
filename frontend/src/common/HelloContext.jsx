import { createContext, useState } from "react";

const userKeyContext = createContext(null);

function HelloContext() {
  const [userKey, setUserKey] = useState();
  return (
    <section>
      <userKeyContext.Provider
        value={[userKey, setUserKey]}
      ></userKeyContext.Provider>
    </section>
  );
}

export default HelloContext;
