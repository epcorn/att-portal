/* eslint-disable react/prop-types */
import {
  Badge,
  Button,
  FileInput,
  Modal,
  Select,
  Spinner,
  Tabs,
  Textarea,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { HiOutlineUpload } from "react-icons/hi";
import FileSection from "./FileSection";
import { useDispatch, useSelector } from "react-redux";
import {
  createCorrespondence,
  getCorrespondence,
} from "../redux/correspondence/correspondenceSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import Loading from "./Loading";

const CorresponUI = ({ contractId = "", quotationId = "" }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [inwardFiles, setInwardFiles] = useState([]);
  const [outwardFiles, setOutwardFiles] = useState([]);
  const [correspondenceId, setCorrespondenceId] = useState("");
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const initInputData = {
    file: "",
    tags: "",
    sender: {
      name: "",
      designation: "",
      organization: "",
      contact: {
        email: "",
        phone: "",
      },
    },
    category: "general",
    description: "",
    title: "",
    quotationId: quotationId ? quotationId : "",
    contractId: contractId ? contractId : "",
    direction: activeTab === 0 ? "inward" : "outward",
  };
  const [inputData, setInputData] = useState(initInputData);
  const { fetching } = useSelector((state) => state.correspondence);
  const [geting, setGeting] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setInputData((prev) => ({
      ...prev,
      direction: activeTab === 0 ? "inward" : "outward",
    }));
  }, [activeTab]);

  useEffect(() => {
    async function fn() {
      try {
        setGeting(true);
        const resut = await dispatch(
          getCorrespondence({ contractId, quotationId })
        );
        const data = await unwrapResult(resut);
        setInwardFiles(data.result?.inward?.files ?? []);
        setOutwardFiles(data.result?.outward?.files ?? []);
        setCorrespondenceId(data.result._id);
        setIsAddFileOpen(false);
      } catch (error) {
        console.error(error);
      } finally {
        setGeting(false);
      }
    }
    fn();
  }, []);

  async function handleFileSubmit() {
    const result = await dispatch(createCorrespondence(inputData));
    const data = await unwrapResult(result);
    setInwardFiles(data.result?.inward?.files);
    setOutwardFiles(data.result?.outward?.files);
    setIsAddFileOpen(false);
    toast.success(data.message);
    setInputData(initInputData);
  }
  function removeFile(activeTab, publicId) {
    if (activeTab === 0) {
      setInwardFiles(inwardFiles.filter((file) => file.publicId !== publicId));
    } else if (activeTab === 1) {
      setOutwardFiles(
        outwardFiles.filter((file) => file.publicId !== publicId)
      );
    } else {
      toast.error(`activeId: ${activeTab} is invalid`);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setInputData((prev) => {
      const newState = { ...prev };
      let current = newState;

      // For file inputs, use the File object from files array
      if (type === "file") {
        current[name] = files[0];
        return newState;
      }

      // Split nested paths (e.g., "sender.contact.email")
      const keys = name.split(".");

      // Traverse nested keys (except last one)
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      // Handle arrays (e.g., tags, category)
      if (Array.isArray(current[keys.at(-1)])) {
        const lastKey = keys.at(-1);
        current[lastKey] = checked
          ? [...current[lastKey], value]
          : current[lastKey].filter((item) => item !== value);
      }
      // Handle regular fields
      else {
        current[keys.at(-1)] = type === "checkbox" ? checked : value;
      }

      return newState;
    });
  };
  if (geting) {
    return <Loading />;
  }
  return (
    <div>
      <div className="p-4 space-y-6 relative">
        <Tabs
          aria-label="Correspondence tabs"
          style="underline"
          onActiveTabChange={setActiveTab}
        >
          <Tabs.Item
            active
            title={
              <div className="flex items-center gap-2">
                <span>Inward Files</span>
                <Badge color="gray" className="ml-1">
                  {inwardFiles.length}
                </Badge>
              </div>
            }
          >
            <FileSection
              activeTab={activeTab}
              files={inwardFiles}
              removeFile={removeFile}
              correspondenceId={correspondenceId}
            />
          </Tabs.Item>

          <Tabs.Item
            title={
              <div className="flex items-center gap-2">
                <span>Outward Files</span>
                <Badge color="gray" className="ml-1">
                  {outwardFiles.length}
                </Badge>
              </div>
            }
            disabled
          >
            <FileSection
              activeTab={activeTab}
              files={outwardFiles}
              removeFile={removeFile}
            />
          </Tabs.Item>
        </Tabs>
        <div className="flex justify-end absolute top-0 right-0">
          <Button
            outline
            gradientDuoTone="pinkToOrange"
            onClick={() => setIsAddFileOpen(true)}
          >
            <HiOutlineUpload className="mr-2 h-5 w-5" />
            Add New File
          </Button>
        </div>
      </div>

      {/* Add File Modal */}
      <Modal
        show={isAddFileOpen}
        onClose={() => setIsAddFileOpen(false)}
        size="2xl"
      >
        <Modal.Header>
          Upload {activeTab === 0 ? "Inward" : "Outward"} File
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <FileInput
              id="file-upload"
              name="file"
              helperText="Upload PDF, DOC, or image files"
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Title"
                name="title"
                required
                onChange={handleChange}
                value={inputData.title}
              >
                <option></option>
                <option value="letter">Letter</option>
                <option value="email">Email</option>
              </Select>
              <Select
                label="Category"
                name="category"
                value={inputData.category} // This controls the selected option
                onChange={handleChange}
              >
                <option value="legal">Legal</option>
                <option value="technical">Technical</option>
                <option value="financial">Financial</option>
                <option value="general">General</option>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Textarea
                label="Description"
                name="description"
                placeholder="Document description"
                value={inputData.description}
                onChange={handleChange}
              ></Textarea>
              <TextInput
                label="Tags"
                name="tags"
                placeholder="Tags (Comma saprated)"
                value={inputData.tags}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                Sender Details
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput
                  name="sender.name"
                  placeholder="Sender name"
                  onChange={handleChange}
                />
                <TextInput
                  name="sender.designation"
                  value={inputData.designation}
                  placeholder="Designation"
                  onChange={handleChange}
                />
                <TextInput
                  name="sender.contact.email"
                  value={inputData.sender.contact.email}
                  placeholder="Email"
                  type="email"
                  onChange={handleChange}
                />
                <TextInput
                  name="sender.contact.phone"
                  value={inputData.sender.contact.phone}
                  placeholder="Phone number"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleFileSubmit}>
            {fetching ? <Spinner /> : "Upload File"}
          </Button>
          <Button color="gray" onClick={() => setIsAddFileOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CorresponUI;
