import re

with open("apps/admin/app/page.tsx", "r") as f:
    content = f.read()

# Remove state variables
state_pattern = r"  // Change Admin Password Modal State\n(?:  const \[[^\]]+\].+;\n)+"
content = re.sub(state_pattern, "", content)

# Remove handleChangePassword
handler_pattern = r"  const handleChangePassword = async \(e: React\.FormEvent\) => \{.*?\n  \};\n"
content = re.sub(handler_pattern, "", content, flags=re.DOTALL)

# Remove password button
button_pattern = r"          <button\n            onClick=\{\(\) => \{\n              setPasswordChangeError\(''\);\n              setNewAdminPassword\(''\);\n              setConfirmAdminPassword\(''\);\n              setChangePasswordModalOpen\(true\);\n            \}\}\n            title=\"Change Admin Password\"\n            className=\"px-2\.5 sm:px-3 py-1\.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95\"\n          >\n            <Lock className=\"w-3 h-3 sm:w-3\.5 sm:h-3\.5 text-amber-400\" />\n            <span className=\"hidden sm:inline\">Password</span>\n          </button>\n"
content = re.sub(button_pattern, "", content)

# Remove modal
modal_pattern = r"        \{\/\* CHANGE ADMIN PASSWORD MODAL \*\/\}\n        \{changePasswordModalOpen && \(.*?\n        \)\}\n"
content = re.sub(modal_pattern, "", content, flags=re.DOTALL)

with open("apps/admin/app/page.tsx", "w") as f:
    f.write(content)

