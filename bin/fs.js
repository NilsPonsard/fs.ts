"use strict";
var fs;
(function (fs) {
    let EntryType;
    (function (EntryType) {
        EntryType[EntryType["file"] = 0] = "file";
        EntryType[EntryType["directory"] = 1] = "directory";
    })(EntryType = fs.EntryType || (fs.EntryType = {}));
    /**
     * an entry in a folder
     *  */
    class Entry {
        constructor(type, dateOfLastEdit) {
            this.type = type;
            this.dateOfLastEdit = dateOfLastEdit;
        }
    }
    class Directory {
        constructor(entries) {
            this.entries = entries;
        }
    }
    fs.VERSION = "0.1.0";
    function upgrade(destructive = false) {
    }
    fs.upgrade = upgrade;
    function init(destructive = true) {
        // check if an existing file system is already in storage
        let rootFolder = localStorage.getItem("/");
        let localVersion = localStorage.getItem("VERSION");
        if (rootFolder && localVersion) {
            let dots = 0;
            for (const c of localVersion) {
                if (c === ".") {
                    ++dots;
                }
            }
            if (dots !== 2) {
                if (destructive) {
                    console.debug("error when parsing the version string, creating a new fs");
                    clear();
                }
                else {
                    throw "error when parsing the version";
                }
            }
            if (localVersion !== fs.VERSION) {
                console.debug("error when parsing the version string");
                upgrade(destructive); // upgrade the fileSystem
            }
        }
        else {
            clear();
        }
    }
    fs.init = init;
    /**
     * create a fresh filesystem
     */
    function clear() {
        localStorage.clear();
        localStorage.setItem("/", {}.toString());
        localStorage.setItem("VERSION", fs.VERSION);
    }
    fs.clear = clear;
    function getContainingFolder(path) {
        return path.slice(0, path.lastIndexOf("/")); // take the name of the folder, with no '/' a the end
    }
    fs.getContainingFolder = getContainingFolder;
    function getFileName(path) {
        return path.slice(path.lastIndexOf("/") + 1); // remove the '/'
    }
    fs.getFileName = getFileName;
    function addEntry(path, name, type) {
        if (!isDir(path))
            throw "given path is not a dir";
        let rawDir = localStorage.getItem(path);
        if (rawDir === null)
            throw "error when reading dir info";
        let dir = JSON.parse(rawDir);
        dir.entries.set(name, new Entry(type, new Date(Date.now())));
    }
    function getDirEntries(path) {
        if (!isDir(path))
            return new Map();
        let rawDir = localStorage.getItem(path);
        if (rawDir == null)
            return new Map();
        let dir = JSON.parse(rawDir);
        if (dir.entries)
            return dir.entries;
        else
            return new Map();
    }
    fs.getDirEntries = getDirEntries;
    function isDir(path) {
        var _a;
        if (localStorage.getItem(path) == null)
            return false;
        if (path == "/")
            return true;
        let parent = getContainingFolder(path);
        if (isDir(parent)) {
            if (((_a = getDirEntries(parent).get(getFileName(path))) === null || _a === void 0 ? void 0 : _a.type) === EntryType.directory)
                return true;
        }
        return false;
    }
    fs.isDir = isDir;
    function readFile(path, options) {
        return localStorage.getItem(path);
    }
    fs.readFile = readFile;
    function writeFile(path, data, options) {
        let folderPath = getContainingFolder(path);
        if (!isDir(folderPath))
            throw "wrong path";
        let parent = localStorage.getItem(folderPath);
        if (parent === null)
            throw "error with the parent folder";
        addEntry(parent, getFileName(path), EntryType.file);
        localStorage.setItem(path, data);
    }
    fs.writeFile = writeFile;
})(fs || (fs = {}));
