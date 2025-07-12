import { Server, Socket } from "socket.io";
import { updateShopDoc } from "../crud";

// Define the structure of user data expected from the client
interface SocketUserData {
  uid: string;
  shop_id: number;
}

// Extend the default Socket type to include userData
interface CustomSocket extends Socket {
  userData?: SocketUserData;
}

/**
 * Sets up WebSocket events and user tracking via Socket.IO
 *
 * @param io - The Socket.IO server instance
 */
function setupSocket(io: Server): void {
  io.on("connection", (socket: CustomSocket) => {
    // Handle initial connection from client
    socket.on("initConnection", async (data: SocketUserData) => {
      socket.userData = data;

      try {
        await updateShopDoc(
          "users",
          data.uid,
          { status: "active", last_seen: new Date() },
          data.shop_id
        );
      } catch (err) {
        console.error("Error updating user status on initConnection:", err);
      }
    });

    // Broadcast new support ticket message to all clients
    socket.on("newTicketMessage", (msg) => {
      io.emit("newTicketMessage", msg);
    });

    // Broadcast typing notification
    socket.on("userTyping", (msg) => {
      io.emit("userTyping", msg);
    });

    // Handle user disconnection
    socket.on("disconnect", async () => {
      if (socket.userData) {
        const { uid, shop_id } = socket.userData;

        try {
          await updateShopDoc(
            "users",
            uid,
            { status: "inactive", last_seen: new Date() },
            shop_id
          );
        } catch (err) {
          console.error("Error updating user status on disconnect:", err);
        }
      }
    });
  });
}

export { setupSocket };
