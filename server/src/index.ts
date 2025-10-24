import "reflect-metadata"; // needed for validation and transformer
import "./util/setup-hostaway-mock"; // setup mock
import { server } from "./server";

const app = server();

app.listen(3000, () => {
  console.log("Listenning on port 3000");
});
