module fs {
    export enum EntryType {
        file, directory
    }
    /**
     * an entry in a folder
     *  */
    class Entry {
        type: EntryType
        dateOfLastEdit: Date
        constructor(type: EntryType, dateOfLastEdit: Date) {
            this.type = type
            this.dateOfLastEdit = dateOfLastEdit
        }
    }
    class Directory {

        entries: Map<string, Entry>
        constructor(entries: Map<string, Entry>) {
            this.entries = entries
        }
    }

    export const VERSION = "0.1.0"
    export function upgrade(destructive = false) {

    }
    export function init(destructive = true) { // if force = true the precendent filesystem will be destroyed if there is an error with the version

        // check if an existing file system is already in storage

        let rootFolder = localStorage.getItem("/")
        let localVersion = localStorage.getItem("VERSION")
        if (rootFolder && localVersion) {
            let dots = 0

            for (const c of localVersion) {
                if (c === ".") {
                    ++dots
                }
            }

            if (dots !== 2) {
                if (destructive) {
                    console.debug("error when parsing the version string, creating a new fs")
                    clear()
                } else {
                    throw "error when parsing the version"
                }
            }
            if (localVersion !== VERSION) {
                console.debug("error when parsing the version string")
                upgrade(destructive) // upgrade the fileSystem
            }
        } else {
            clear()
        }
    }
    /**
     * create a fresh filesystem
     */
    export function clear() {
        localStorage.clear()
        localStorage.setItem("/", {}.toString())
        localStorage.setItem("VERSION", VERSION)
    }
    export function getContainingFolder(path: string) {
        return path.slice(0, path.lastIndexOf("/")) // take the name of the folder, with no '/' a the end
    }
    export function getFileName(path: string) {
        return path.slice(path.lastIndexOf("/") + 1) // remove the '/'
    }

    function addEntry(path: string, name: string, type: EntryType) { // path of a dir
        if (!isDir(path)) throw "given path is not a dir"
        let rawDir = localStorage.getItem(path)
        if (rawDir === null) throw "error when reading dir info"
        let dir = JSON.parse(rawDir) as Directory

        dir.entries.set(name, new Entry(type, new Date(Date.now())))



    }

    export function getDirEntries(path: string): Map<string, Entry> {
        if (!isDir(path)) return new Map()

        let rawDir = localStorage.getItem(path)
        if (rawDir == null) return new Map()
        let dir = JSON.parse(rawDir) as Directory
        if (dir.entries) return dir.entries
        else return new Map()
    }

    export function isDir(path: string): boolean {
        if (localStorage.getItem(path) == null) return false
        if (path == "/") return true
        let parent = getContainingFolder(path)
        if (isDir(parent)) {
            if (getDirEntries(parent).get(getFileName(path))?.type === EntryType.directory) return true
        }
        return false
    }

    export function readFile(path: string, options: any): string | null {

        return localStorage.getItem(path)
    }
    export function writeFile(path: string, data: string, options: any) {
        let folderPath = getContainingFolder(path)
        if (!isDir(folderPath)) throw "wrong path"
        let parent = localStorage.getItem(folderPath)
        if (parent === null) throw "error with the parent folder"
        addEntry(parent, getFileName(path), EntryType.file)

        localStorage.setItem(path, data)
    }

}