// src/utils/fetchEnsNames.js
export const fetchEnsNames = async (addresses) => {
    const ensNames = {};
    await Promise.all(
      addresses.map(async (address) => {
        try {
          const response = await fetch(
            "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: `
                  query($address: String!) {
                    domains(where: { resolvedAddress: $address }) {
                      name
                    }
                  }
                `,
                variables: { address: address.toLowerCase() },
              }),
            }
          );
          const data = await response.json();
          if (
            data.data &&
            data.data.domains &&
            data.data.domains.length > 0
          ) {
            ensNames[address.toLowerCase()] = data.data.domains
              .map((domain) => domain.name)
              .join(", ");
          } else {
            ensNames[address.toLowerCase()] = null;
          }
        } catch (error) {
          console.error(`Error fetching ENS name for ${address}:`, error);
          ensNames[address.toLowerCase()] = null;
        }
      })
    );
    return ensNames;
  };
  