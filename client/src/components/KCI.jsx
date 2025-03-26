/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Button, Label, Table, TableCell, TextInput } from "flowbite-react";
import { GiCancel } from "react-icons/gi";
import { customAlphabet } from "nanoid";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  21
);

function KCI({ quote, setQuote, addressKey }) {
  const [validKci, setValidKci] = useState(false);
  const [kciObj, setKciObj] = useState({
    id: nanoid(),
    name: "",
    designation: "",
    contact: "",
    email: "",
  });
  const [showForm, setShowForm] = useState(false);
  const kciArrayRef = useRef(quote[String(addressKey)]?.kci || []);

  useEffect(() => {
    kciArrayRef.current = quote[String(addressKey)]?.kci;
  }, [addressKey, quote]);
  useEffect(() => {
    const isValid =
      kciObj.name !== "" && (kciObj.contact !== "" || kciObj.email !== "");
    setValidKci(isValid);
  }, [kciObj]);

  function handleKci(e) {
    const { name, value } = e.target;
    setKciObj((prev) => ({ ...prev, [name]: value }));
  }
  function deleteKci(id) {
    kciArrayRef.current = kciArrayRef.current.filter((kci) => kci.id !== id);
    setQuoteLatest();
  }
  function setQuoteLatest() {
    setQuote((prev) => ({
      ...prev,
      [addressKey]: {
        ...prev[addressKey],
        kci: kciArrayRef.current,
      },
    }));
  }
  function addKci() {
    if (kciObj.name !== "" && (kciObj.contact !== "" || kciObj.email !== "")) {
      kciArrayRef.current = [...kciArrayRef.current, kciObj];
      setKciObj({
        id: nanoid(),
        name: "",
        designation: "",
        contact: "",
        email: "",
      });
      setShowForm(false);
      // Trigger a re-render
      setQuoteLatest();
    } else {
      toast.error("Please fill out all required fields.");
    }
  }
  function editKCI(id) {
    // Find the KCI entry using 'id'
    const kci = kciArrayRef.current.find((el) => el.id === id);
    if (kci) {
      // Set the found KCI object to kciObj state
      setKciObj(kci);
      deleteKci(id);
      // Update the quote state to trigger a re-render
      setQuoteLatest();
      // Show the form for editing
      setShowForm(true);
    } else {
      console.error(`KCI with id ${id} not found`);
    }
  }
  return (
    <div className="bg-[#C8A1E0] border rounded-lg shadow-md p-4 mt-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Key Contact Information (KCI)</h2>
        <Button
          gradientMonochrome="gray"
          className="mb-2 border-2 border-gray-500"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide Form" : "Add Info"}
        </Button>
      </div>
      {showForm && (
        <div>
          <div className="flex gap-4 mb-4">
            <div>
              <Label htmlFor="name">Name:</Label>
              <TextInput name="name" value={kciObj.name} onChange={handleKci} />
            </div>
            <div>
              <Label htmlFor="contact">Contact:</Label>
              <TextInput
                name="contact"
                value={kciObj.contact}
                onChange={handleKci}
              />
            </div>
            <div>
              <Label htmlFor="email">Email:</Label>
              <TextInput
                type="email"
                name="email"
                value={kciObj.email}
                onChange={handleKci}
              />
            </div>
            <div className="flex items-center justify-center mt-5">
              <Button
                onClick={addKci}
                color={validKci ? "success" : "failure"}
                size="xs"
                className={`border ${
                  validKci
                    ? "animate-pulse shadow-red-500 shadow-lg"
                    : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!validKci} // Disable the button if not valid
              >
                ok
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table hoverable className="w-full">
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Contact</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Edit</Table.HeadCell>
            <Table.HeadCell>Delete</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {kciArrayRef.current.map((kci, idx) => (
              <Table.Row
                key={kci.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                } dark:bg-gray-800`}
              >
                <Table.Cell className="text-nowrap">{kci.name}</Table.Cell>
                <Table.Cell className="text-nowrap">{kci.contact}</Table.Cell>
                <Table.Cell className="text-nowrap">{kci.email}</Table.Cell>
                <TableCell>
                  <button
                    onClick={() => editKCI(kci.id)}
                    size="xs"
                    className="bg-green-500 rounded-full hover:bg-green-700  text-white p-1"
                  >
                    <FaEdit className="text-white w-5 h-5" />
                  </button>
                </TableCell>
                <Table.Cell>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => deleteKci(kci.id)}
                      size="xs"
                      className="bg-red-500 rounded-full hover:bg-red-700 text-white p-1"
                    >
                      <GiCancel className="text-white w-5 h-5" />
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default KCI;
