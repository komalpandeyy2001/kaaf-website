import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from './Firebase/firebase'
import { Link, useNavigate, useLocation } from 'react-router-dom'
