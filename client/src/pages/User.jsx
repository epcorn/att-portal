import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  register,
  updateUser,
  deleteUser,
} from "../redux/user/userSlice";
import {
  addChemical,
  addBatchNumber,
  deleteBatchNumber,
  deleteChemical,
  getChemicals,
} from "../redux/contract/contractSlice.js";
import {
  Button,
  Checkbox,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { unwrapResult } from "@reduxjs/toolkit";
import { CustomModal, PageHeader } from "../components/index.js";
import { toast } from "react-toastify";

const userInit = {
  username: "",
  prefix: "",
  initials: "",
  password: "",
  rights: {
    createQuote: false,
    createContract: false,
    genCard: false,
    workLogUpdate: false,
    approve: false,
    admin: false,
  },
};
export default function User() {
  const { currentUser, allUsers } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState(userInit);
  const [openModal, setOpenModal] = useState(false);
  const [update, setUpdate] = useState(false);
  const [rights, setRights] = useState([]);
  const [chemicalModel, setChemicalModel] = useState(false);
  const [batchModel, setBatchModel] = useState(false);
  const [chemicalData, setChemicalData] = useState("");
  const [batchData, setBatchData] = useState({
    batchNo: "",
    _id: "",
  });
  const [uploading, setUploading] = useState(false);
  const [chemicalList, setChemicalList] = useState([]);

  function onCloseModal() {
    setOpenModal(false);
  }

  useEffect(() => {
    setRights(Object.keys(userInit.rights));
  }, [setRights]);

  useEffect(() => {
    async function fetchChemicals() {
      if (!currentUser.rights.admin) {
        navigate("/");
      } else {
        dispatch(getUsers());
        const actionResult = await dispatch(getChemicals());
        const result = unwrapResult(actionResult);
        setChemicalList(result.data);
      }
    }
    fetchChemicals();
  }, [currentUser, navigate, dispatch]);

  const handleRights = (e) => {
    if (e.target.checked) {
      setUser((prev) => ({
        ...prev,
        rights: {
          ...prev.rights,
          [e.target.id]: true,
        },
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        rights: {
          ...prev.rights,
          [e.target.id]: false,
        },
      }));
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const registerUser = async () => {
    const resultAction = await dispatch(register(user));
    // eslint-disable-next-line no-unused-vars
    const result = unwrapResult(resultAction);
    onCloseModal();
    setUser(userInit);
  };
  const handleUpdateUser = async () => {
    const resultAction = await dispatch(updateUser(user));
    // eslint-disable-next-line no-unused-vars
    const result = unwrapResult(resultAction);
    onCloseModal();
    setUpdate(false);
    setUser(userInit);
  };
  const deleteIt = (id) => {
    dispatch(deleteUser(id));
  };
  function splitByCapitalLetters(text) {
    // Use a regular expression to split by capital letters
    const splitArray = text.split(/(?=[A-Z])/).filter(Boolean);

    // Capitalize the first character of the first word
    if (splitArray.length > 0) {
      splitArray[0] =
        splitArray[0].charAt(0).toUpperCase() + splitArray[0].slice(1);
    }

    // Join the array with spaces in between
    return splitArray.join(" ");
  }
  async function addChem() {
    try {
      setUploading(true);
      const actionResult = await dispatch(addChemical(chemicalData));
      const result = unwrapResult(actionResult);
      toast.success(result.message);
      setChemicalList((prev) => [...prev, result.data]);
      setChemicalData("");
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  }
  async function delChem() {
    try {
      setUploading(true);
      const actionResult = await dispatch(deleteChemical(chemicalData));
      const result = unwrapResult(actionResult);
      toast.success(result.message);
      setChemicalData("");
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  }
  async function addBatch() {
    try {
      setUploading(true);
      const actionResult = await dispatch(addBatchNumber(batchData));
      const result = unwrapResult(actionResult);
      toast.success(result.message);
      setBatchData((prev) => ({ ...prev, batchNo: "" }));
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  }
  async function delBatch() {
    try {
      setUploading(true);
      const actionResult = await dispatch(deleteBatchNumber(batchData));
      const result = unwrapResult(actionResult);
      toast.success(result.message);
      setBatchData((prev) => ({ ...prev, batchNo: "" }));
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-3 ">
      <div className=" mt-3 h-full">
        <PageHeader
          bgColor="bg-[#6FDCE3]"
          recentTitle="All Users"
          buttons={
            <>
              <button
                className="bg-[#FFFDB5] hover:bg-yellow-200 font-medium py-2 px-4 rounded mr-2"
                onClick={() => setChemicalModel(true)}
              >
                Chemical
              </button>
              <button
                onClick={() => setBatchModel(true)}
                className="bg-[#FFFDB5] hover:bg-yellow-200 font-medium py-2 px-4 rounded mr-2"
              >
                Batch No
              </button>
              <button
                onClick={() => setOpenModal(true)}
                className="bg-[#FFFDB5] hover:bg-yellow-200 font-medium py-2 px-4 rounded mr-2"
              >
                New User
              </button>
            </>
          }
        />
        <div className=" overflow-x-auto ">
          <Table>
            <Table.Head>
              <Table.HeadCell>User</Table.HeadCell>
              <Table.HeadCell>Rights</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {allUsers.length > 0 &&
                allUsers.map((user) => (
                  <Table.Row
                    key={user._id}
                    className={
                      currentUser._id === user._id ? "bg-gray-100" : ""
                    }
                  >
                    <Table.Cell>{user.username}</Table.Cell>
                    <Table.Cell className="border">
                      <div className="flex items-center justify-around flex-wrap">
                        <div className="grid grid-cols-12">
                          {rights.map((right, idx) => (
                            <div className="mr-2 col-span-2" key={idx}>
                              <div className="">
                                <Label
                                  htmlFor={right}
                                  value={splitByCapitalLetters(right)}
                                />
                              </div>
                              <Checkbox
                                disabled
                                id={right}
                                value={right}
                                checked={user.rights[right]}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="border">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <Button
                          pill
                          color="yellow"
                          onClick={() => [
                            setOpenModal(true),
                            setUser(user),
                            setUpdate(true),
                          ]}
                        >
                          Edit
                        </Button>
                        <Button
                          pill
                          color={user.active ? "failure" : "success"}
                          onClick={() =>
                            dispatch(
                              updateUser({ ...user, active: !user.active })
                            )
                          }
                        >
                          {user.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          pill
                          color="red"
                          onClick={() => deleteIt(user._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
        </div>
      </div>
      <Modal
        show={openModal}
        size="md"
        onClose={() => [onCloseModal(), setUpdate(false), setUser(userInit)]}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              {update ? "Update User" : "Create User"}
            </h3>
            <div className=" w-full grid grid-cols-12">
              <div className="col-span-3">
                <div className="mb-2 block">
                  <Label htmlFor="prefix" value="Prefix" />
                </div>
                <Select
                  id="prefix"
                  name="prefix"
                  value={user.prefix}
                  onChange={handleChange}
                  required
                >
                  <option></option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                  <option>Miss</option>
                  <option>Master</option>
                  <option>Dr.</option>
                  <option>Rev.</option>
                  <option>Prof.</option>
                  <option>Hon.</option>
                  <option>Sir</option>
                </Select>
              </div>

              <div className=" col-span-9">
                <div className="mb-2 block">
                  <Label htmlFor="username" value="Enter Username" />
                </div>
                <TextInput
                  id="username"
                  name="username"
                  placeholder="username..."
                  value={user.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="initials" value="Enter Initials" />
              </div>
              <TextInput
                id="initials"
                name="initials"
                placeholder="Name Initials..."
                value={user.initials}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Enter password" />
              </div>
              <TextInput
                id="password"
                name="password"
                placeholder="********"
                type="text"
                value={user.password}
                required
                onChange={handleChange}
              />
            </div>
            <div className="block font-bold">
              <Label value="User Rights" />
            </div>
            <div className="w-full flex items-center justify-center border rounded-lg">
              <div className="grid grid-cols-12 flex-wrap gap-2 p-1 ">
                {rights.map((right, idx) => (
                  <div key={idx} className=" col-span-4">
                    <div className="mb-2 block">
                      <Label
                        htmlFor={right}
                        value={splitByCapitalLetters(right)}
                      />
                    </div>
                    <Checkbox
                      id={right}
                      value={right}
                      checked={user.rights[right]}
                      onClick={(e) => handleRights(e)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-300">
              <Button
                onClick={() => (update ? handleUpdateUser() : registerUser())}
              >
                {update ? "Edit User" : "Create User"}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <CustomModal
        isOpen={chemicalModel}
        onClose={() => setChemicalModel(!chemicalModel)}
        size="md"
        heading={
          <div className="flex gap-3 items-center justify-center">
            <span className="text-lg font-semibold text-gray-800">
              Add/Delete Chemical
            </span>
          </div>
        }
      >
        <div className="w-full p-4">
          <h1 className="text-lg font-medium text-gray-700 mb-4 text-center">
            Chemical
          </h1>
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="" value="Chemical Name" />
            </div>
            <TextInput
              placeholder="Enter Chemical"
              className="mb-4 w-full"
              sizing="md"
              value={chemicalData}
              onChange={(e) => setChemicalData(e.target.value)}
            />
          </div>
          <div className="w-full flex items-center justify-around">
            <Button
              onClick={addChem}
              color="yellow"
              className="mr-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className=" pr-3">Loading...</span>
                  <Spinner size="sm" />
                </>
              ) : (
                "Add"
              )}
            </Button>
            <Button onClick={delChem} color="red" disabled={uploading}>
              {uploading ? (
                <>
                  <span className=" pr-3">Loading...</span>
                  <Spinner size="sm" />
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={batchModel}
        onClose={() => setBatchModel(!batchModel)}
        size="md"
        heading={
          <div className="flex gap-3 items-center justify-center">
            <span>Add/Delete Batch No</span>
          </div>
        }
      >
        <div className="w-full p-4">
          <h1 className="text-xl font-medium text-gray-700 mb-4 text-center">
            Batch No
          </h1>
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="" value="Select a Chemical"></Label>
            </div>
            <Select
              name="chemical"
              onChange={(e) => {
                console.log(e);
                return setBatchData((prev) => ({
                  ...prev,
                  _id: e.target.value,
                }));
              }}
            >
              <option></option>
              {chemicalList?.map((chem) => (
                <option key={chem._id} value={chem._id}>
                  {chem.chemical}
                </option>
              ))}
            </Select>
          </div>
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="" value="Batch No" />
            </div>
            <TextInput
              placeholder="Enter Batch No"
              className="mb-4 w-full"
              sizing="md"
              value={batchData.batchNo}
              name="batchNo"
              onChange={(e) =>
                setBatchData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            ></TextInput>
          </div>

          <div className="w-full flex items-center justify-around">
            <Button
              onClick={addBatch}
              color="yellow"
              className="mr-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className=" pr-3">Loading...</span>
                  <Spinner size="sm" />
                </>
              ) : (
                "Add"
              )}
            </Button>
            <Button onClick={delBatch} color="red" disabled={uploading}>
              {uploading ? (
                <>
                  <span className=" pr-3">Loading...</span>
                  <Spinner size="sm" />
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
