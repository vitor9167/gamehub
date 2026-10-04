const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
) {
  const {
    token,
    headers,
    ...rest
  } = options;

  return fetch(`${API_URL}${path}`, {
    ...rest,

    headers: {
      ...headers,

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });
}

export async function apiJson<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const response =
    await apiFetch(path, options);

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // Algumas respostas podem não possuir JSON.
  }

  if (!response.ok) {
    let message =
      "Ocorreu um erro ao processar a solicitação.";

    if (
      data &&
      typeof data === "object" &&
      "message" in data
    ) {
      const apiMessage = (
        data as {
          message?: string | string[];
        }
      ).message;

      if (Array.isArray(apiMessage)) {
        message =
          apiMessage.join(", ");
      } else if (
        typeof apiMessage === "string"
      ) {
        message = apiMessage;
      }
    }

    throw new ApiError(
      message,
      response.status,
    );
  }

  return data as T;
}